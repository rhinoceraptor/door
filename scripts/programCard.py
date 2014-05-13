# Thank you to jness on github for the legwork on getting the magstripe working
# https://github.com/jness/magtek_cardreader/blob/master/main.py
###############################################################################
import usb.core
import usb.util
import datetime
import json
import hashlib
###############################################################################
# MagTek Device MSR100 Mini Swipe Vendor info
vendorid = 0x0801
productid = 0x0001
###############################################################################

# Define our Character Map per Reference Manual, load it from json
# http://www.magtek.com/documentation/public/99875206-17.01.pdf
with open('/opt/magstripe/data/chrMap.json', 'rb') as chrMapOpen:
	chrMap = json.load(chrMapOpen)
with open('/opt/magstripe/data/chrShiftMap.json' ,'rb') as chrShiftMapOpen:
	chrShiftMap = json.load(chrShiftMapOpen)

name = raw_input('Enter name: ')

# find our device by id
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

# Load our devices configuration
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

# Create a list of 8 bit bytes and remove
# Empty bytes
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
	elif n[2] in chrShiftMap and n[0] == 2:
		sdata += chrShiftMap[n[2]]

print sdata

# Get the hash of the card string
cardhash = hashlib.sha256(sdata)
print cardhash.hexdigest()

# Write the name, card hash to users.csv
with open("/opt/magstripe/data/users.csv", "a") as progFile:
	progFile.write(name + ',' + cardhash.hexdigest() + '\n')

# Log the card programming event
with open("/opt/magstripe/data/log.txt", "a") as logFile:
	now = datetime.datetime.now()
	logFile.write(name + "'s card was programmed at " str(now))