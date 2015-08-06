/*
 * door.c - Opens the door in a self contained C program.
 * This program will get a setuid bit for root so that Node.js scripts will
 * be able to open the door without themselves being root.
 *
 * Since bit banging to the stepper board is somewhat timing sensitive, the C
 * implementation of opening the door will also be faster.
 *
 * Install the WiringPi library from here:
 * https://projects.drogon.net/raspberry-pi/wiringpi/download-and-install/
 */

#include <stdlib.h>
#include <stdio.h>
#include <wiringPi.h>

#define relay_pin 7
#define sensor_pin 1
#define step_pin 2
#define dir_pin 0

#define num_steps 4100
#define max_steps (num_steps * 2)

#define left 0
#define right 1

int main(void) {
  /* Check that WiringPi is successfully installed */
  if (wiringPiSetup() == -1) {
    printf("Error with wiringPi!\n");
    return 1;
  }

  /* Open the required GPIO */
  pinMode(relay_pin, OUTPUT);
  digitalWrite(relay_pin, 0);
}
