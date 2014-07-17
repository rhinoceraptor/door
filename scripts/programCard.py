#!/usr/bin/env python

"""
Thank you to jness on github for the legwork on getting the magstripe working
https://github.com/jness/magtek_cardreader/blob/master/main.py
"""

import usb.core
import usb.util
import datetime
import json
import hashlib

# MagTek Device MSR100 Mini Swipe Vendor info
vendorid = 0x0801
productid = 0x0001

def recordCard(name, card):
	# Write the name, card hash to users.csv
	with open("/opt/magstripe/data/users.csv", "a") as progFile:
		progFile.write(name + ',' + card + '\n')

def log(name):
	# Log the card programming event
	with open("/opt/magstripe/data/log.txt", "a") as logFile:
		now = datetime.datetime.now()
		logFile.write(name + "'s card was programmed at " str(now))

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
	time.sleep(.1)
	print 'Swipe Card:'
	raw_data = readerData.next()  # get next swipe when available
	data = decode(raw_data)  # map bytes to ascii
	card = str(hashlib.sha256(data).hexdigest())  # hashify
	print '>>> {}: '.format(data, card)

	name = raw_input('Enter name: ')
	recordCard(name, card)
	log(name)

if __name__ == '__main__':
	main()
