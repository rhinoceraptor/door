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

#define STEP_DELAY_MCS 300
#define OPEN_DELAY_MS 5000

#define relay_pin 7
#define sensor_pin 1
#define step_pin 2
#define dir_pin 0

#define num_steps 4300
#define max_steps (num_steps * 2)

#define cw 0
#define ccw 1

/* Step the stepper motor clockwise or counter clockwise. */
void step(int direction)
{
  if (direction != cw && direction != ccw )
  {
    printf("Error: pass step() function 1 or 0 only!\n");
    digitalWrite(relay_pin, 0);
    exit(1);
  }

  /* Write the direction, and pulse the step pin */
  digitalWrite(dir_pin, direction);
  digitalWrite(step_pin, 1);
  digitalWrite(step_pin, 0); 

  delayMicroseconds(STEP_DELAY_MCS);
  return;
}

int main(void)
{
  /* Check that WiringPi is successfully installed */ 
  if (wiringPiSetup() == -1)
  {
    printf("Error with wiringPi!\n");
    return 1;
  }

  /* Open the required GPIO */
  pinMode(relay_pin, OUTPUT);
  pinMode(sensor_pin, INPUT);
  pinMode(step_pin, OUTPUT);
  pinMode(dir_pin, OUTPUT);

  digitalWrite(relay_pin, 1);

  /* Turn the handle clockwise, e.g. open the handle */
  int iter = max_steps;
  while (digitalRead(sensor_pin) == 0 && iter > 1)
  {
    step(cw);
    iter--;
  }

  /* Delay for the user to open the door */
  delay(OPEN_DELAY_MS);

  /* Turn the handle back to normal, e.g. close the door */
  for (int i = 0; i < num_steps; i++)
    step(ccw);

  /* Turn off the relay */
  digitalWrite(relay_pin, 0);
  return 0;
}
    
