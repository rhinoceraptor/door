#!/usr/bin/env python

"""
Thank you to jness on github for the legwork on getting the magstripe working
https://github.com/jness/magtek_cardreader/blob/master/main.py
"""

import time
import hashlib
import json
import threading
import RPi.GPIO as GPIO
from datetime import datetime as dt
from usb import core, utilu

# MagTek Device MSR100 Mini Swipe
vendorid = 0x0801
productid = 0x0001

# Pin data
RED_PIN = 13
GREEN_PIN = 15
SERVO_PIN = 7

# mapping dicts for reader output
chrMap = {4:'a', 5:'b', 6:'c', 7:'d', 8:'e', 9:'f', 10:'g', 11:'h', 12:'i', 13:'j', 14:'k', 15:'l', 16:'m', 17:'n', 18:'o', 19:'p', 20:'q', 21:'r', 22:'s', 23:'t', 24:'u', 25:'v', 26:'w', 27:'x', 28:'y', 29:'z', 30:'1', 31:'2', 32:'3', 33:'4', 34:'5', 35:'6', 36:'7', 37:'8', 38:'9', 39:'0', 40:'KEY_ENTER', 41:'KEY_ESCAPE', 42:'KEY_BACKSPACE', 43:'KEY_TAB', 44:' ', 45:'-', 46:'=', 47:'[', 48:']', 49:'\\', 51:';', 52:'\'', 53:'`', 54:',', 55:'.', 56:'/', 57:'KEY_CAPSLOCK'}
chrShiftMap = {4:'A', 5:'B', 6:'C', 7:'D', 8:'E', 9:'F', 10:'G', 11:'H', 12:'I', 13:'J', 14:'K', 15:'L', 16:'M', 17:'N', 18:'O', 19:'P', 20:'Q', 21:'R', 22:'S', 23:'T', 24:'U', 25:'V', 26:'W', 27:'X', 28:'Y', 29:'Z', 30:'!', 31:'@', 32:'#', 33:'$', 34:'%', 35:'^', 36:'&', 37:'*', 38:'(', 39:')', 40:'KEY_ENTER', 41:'KEY_ESCAPE', 42:'KEY_BACKSPACE', 43:'KEY_TAB', 44:' ', 45:'_', 46:'+', 47:'{', 48:'}', 49:'|', 51:':', 52:'"', 53:'~', 54:'<', 55:'>', 56:'?', 57:'KEY_CAPSLOCK'}

def blinkLight(auth):
	GPIO.setmode(GPIO.BOARD)
	# Set up the red and green pins as outputs
	GPIO.setup(RED_PIN, GPIO.OUT)
	GPIO.setup(GREEN_PIN, GPIO.OUT)

	if auth == True:
		PIN = GREEN_PIN
	else:
		PIN = RED_PIN
		for i in range(3):
			GPIO.output(PIN, True)
			time.sleep(0.5)
			GPIO.output(PIN, False)
			time.sleep(0.25)

def openDoor():
	"""
	From RadioShack Spec Sheet:
	Duration of Logic High (ms)     Angle (degree)          Duty Cycle (out of 20ms)
			0.6								0						3%
			0.9								30						4.5%
			1.2								60						6%
			1.5								90						7.5%
			1.8								120						9%
			2.1								150						10.5%

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

def initReader():
	device = usb.core.find(idVendor = vendorid, idProduct = productid)

	if device is None:
		raise Exception('Could not find USB Card Reader')

	# Remove device from kernel, this should stop
	# Reader from printing to screen and remove /dev/input
	if device.is_kernel_driver_active(0):
		try:
			device.detach_kernel_driver(0)  # detached kernel driver
		except usb.core.USBError as e:
			raise Exception('Could not detatch kernel driver: %s' % str(e))

	# Load our device's configuration
	try:
		device.set_configuration()
		device.reset()
	except usb.core.USBError as e:
		raise Exception('Could not set configuration: %s' % str(e))

	return device

def readerData():
	device = initReader()
	endpoint = device[0][(0,0)][0]
	ibuffer = []
	while True:  # Wait for swipe
		time.sleep(.1)
		try:
			data = device.read(endpoint.bEndpointAddress, endpoint.wMaxPacketSize, timeout = 5)
			ibuffer.append(data)
		except usb.core.USBError as e:
				pass # let's try again
				print '>>> Reader Timeout'
		if len(data) != 0:  # swipe detected
			out = ibuffer.pop(0).tolist()
			if sum(out) != 0:  # Ignore empty bytes
				yield out

def decode(ndata):
	# Parse over our bytes and create string to final return
	sdata = ''
	for n in ndata:
		# Handle non shifted letters
		if n[2] in chrMap and n[0] == 0:
			sdata += chrMap[n[2]]
		# Handle shifted letters
		elif n[2] in chrShiftMap and n[0] == 2:
			sdata += chrShiftMap[n[2]]
	return sdata

def main():
	while True:
		time.sleep(.1)
		print 'Swipe Card:'
		raw_data = readerData.next()  # get next swipe when available
		data = decode(raw_data)  # map bytes to ascii
		card = str(hashlib.sha256(data).hexdigest())  # hashify
		print '>>> {}: '.format(data, card)

		# Reload dict of registered card info
		with open('/opt/magstripe/data/users.csv', 'r') as f:
			cards = {v:k for k,v in [x.split(',') for x in f.read().splitlines()]}

		# determine if card is registered
		user = cards.get(card, None)

		# blink lights for immediate feedback
		feedback = threading.Thread(target=blinkLight, args=(bool(user),))
		feedback.start()

		if user:
			log = '{} opened the door at {}'.format(user, dt.now())
			with open('/opt/magstripe/data/log.txt', 'a') as logFile:
				logFile.write('{}\n'.format(log))
			print '>>> {}'.format(log)
			openDoor()
			print '>>> Door opened'

if __name__ == '__main__':
	main()
