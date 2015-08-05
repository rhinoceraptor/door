/*
 * Install the WiringPi library from here:
 * https://projects.drogon.net/raspberry-pi/wiringpi/download-and-install/
 */

#include <stdlib.h>
#include <stdio.h>
#include <wiringPi.h>

#define state_pin 3

int main(void) {
  /* Check that WiringPi is successfully installed */
  if (wiringPiSetup() == -1) {
    printf("Error with wiringPi!\n");
    return 1;
  }

  /* Open the required GPIO */
  pinMode(state_pin, INPUT);
  printf("%d", digitalRead(state_pin));
  return 0;
}
