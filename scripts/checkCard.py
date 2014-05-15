# Thank you to jness on github for the legwork on getting the magstripe working
# https://github.com/jness/magtek_cardreader/blob/master/main.py
###############################################################################
import usb.core
import usb.util
import RPi.GPIO as GPIO
import time
import hashlib
import sys
import datetime
###############################################################################
# MagTek Device MSR100 Mini Swipe
vendorid = 0x0801
productid = 0x0001

SERVO_PIN = 7
###############################################################################

def openDoor():
	"""
	From RadioShack Spec Sheet:
	Duration of Logic High (ms)     Angle (degree)          Duty Cycle (out of 20ms)
			0.6                             0                       3%
			0.9                             30                      4.5%
			1.2                             60                      6%
			1.5                             90                      7.5%
			1.8                             120                     9%
			2.1                             150                     10.5%

	PWM control is on pin 7.
	"""
	GPIO.setmode(GPIO.BOARD)
	GPIO.setup(SERVO_PIN, GPIO.OUT)
	pwm = GPIO.PWM(SERVO_PIN, 50)   # setup PWM on SERVO_PIN (which is 7), at 50hz (20ms)

	# Sweep the servo to 150 degrees, wait five seconds, then back to 0 degrees
	pwm.start(3)
	pwm.ChangeDutyCycle(10.5)
	time.sleep(5)
	pwm.ChangeDutyCycle(3)
	time.sleep(1)

	# Close the GPIO
	pwm.stop()
	GPIO.cleanup()

def main():
	# Define our Character Map per Reference Manual, load it from json
	# http://www.magtek.com/documentation/public/99875206-17.01.pdf
	with open('/opt/magstripe/data/chrMap.json', 'rb') as chrMapOpen:
		chrMap = json.load(chrMapOpen)
	with open('/opt/magstripe/data/chrShiftMap.json' ,'rb') as chrShiftMapOpen:
		chrShiftMap = json.load(chrShiftMapOpen)
		
	while True:
		# Find our device by id
		device = usb.core.find(idVendor = vendorid, idProduct = productid)
		if device is None:
			raise Exception('Could not find USB Card Reader')

		# Remove device from kernel, this should stop
		# Reader from printing to screen and remove /dev/input
		if device.is_kernel_driver_active(0):
			try:
				device.detach_kernel_driver(0)
			except usb.core.USBError as e:
				raise Exception("Could not detatch kernel driver: %s" % str(e))

		# Load our device's configuration
		try:
			device.set_configuration()
			device.reset()
		except usb.core.USBError as e:
			raise Exception("Could not set configuration: %s" % str(e))

		# Get device endpoint information
		endpoint = device[0][(0,0)][0]

		swiped = False
		data = []
		datalist = []
		print 'Swipe Card:'
		while True:
			try:
				results = device.read(endpoint.bEndpointAddress, endpoint.wMaxPacketSize, timeout = 5)
				data += results
				datalist.append(results)
				swiped = True

			except usb.core.USBError as e:
				if e.args[1] == 'Operation timed out' and swiped:
					break # timeout and swiped means we are done

		# Create a list of 8 bit bytes and remove empty bytes
		ndata = []
		for d in datalist:
			if d.tolist() != [0, 0, 0, 0, 0, 0, 0, 0]:
				ndata.append(d.tolist())

		# Parse over our bytes and create string to final return
		sdata = ''
		for n in ndata:
			# Handle non shifted letters
			if n[2] in chrMap and n[0] == 0:
				sdata += chrMap[n[2]]
			# Handle shifted letters
			elif n[2] in shiftchrMap and n[0] == 2:
				sdata += shiftchrMap[n[2]]

		# Get the hash of the card string
		cardhash = hashlib.sha256(sdata)

		# Check if the hash is in the users.csv file
		cardFile = file('/opt/magstripe/data/users.csv')
		for lines in cardFile:
			if str(cardhash.hexdigest()) in lines:
				# User is validated, so log the event
				name = lines.split(',')[0]
				now = datetime.datetime.now()
				log = name + " opened the door at " + str(now) + "\n"
				with open("/opt/magstripe/data/log.txt", "a") as logFile:
					logFile.write(log)
				logFile.close()

				# Finally, open the door!
				openDoor()
