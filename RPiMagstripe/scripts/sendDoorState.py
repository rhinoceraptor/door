import paramiko
import subprocess
import time
import RPi.GPIO as GPIO

# Fill this out with your own info if desired.
user = ""
passwd = ""
server = ""

DOOR_ONE = 16
DOOR_TWO = 18

def getState():
	# Set the GPIO numbering mode to the raw pin numbers.
	GPIO.setmode(GPIO.BOARD)
	# Set up the door one and two pins as inputs, and enable the
	# pull down resistors to get clean data from them.
	GPIO.setup(DOOR_ONE, GPIO.IN, pull_up_down = GPIO.PUD_DOWN)
	GPIO.setup(DOOR_TWO, GPIO.IN, pull_up_down = GPIO.PUD_DOWN)
		
	# Construct the state string using the states from the GPIO.
	state = ""
	if GPIO.input(DOOR_ONE) == GPIO.HIGH:
		state += "The main door is closed. "
	elif GPIO.input(DOOR_ONE) == GPIO.LOW:
		state += "The main door is open. "
	if GPIO.input(DOOR_TWO) == GPIO.HIGH:
		state += "The second door is closed."
	elif GPIO.input(DOOR_TWO) == GPIO.LOW:
		state += "The second door is open."
	return state

def writeState():
	ssh = paramiko.SSHClient()
	ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
	ssh.connect(server, username = user, password = passwd)

	# write the door state to doorState.txt using echo in bash
	state = getState()
	cmd = 'echo ' + state + ' > doorState.txt'
	print cmd
	(stdin, stdout, stderr) = ssh.exec_command(cmd)
	for line in stdout.readlines():
		print line
	ssh.close()
	print "Wrote door state and closed connection"

def main():
	writeState()

if __name__ == '__main__':
	main()