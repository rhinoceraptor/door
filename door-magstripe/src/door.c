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

#include <stdio.h>
#include <wiringPi.h>

#define relay_pin
#define sensor_pin
#define step_pin
#define dir_pin

#define num_steps 2000
#define max_steps (num_steps * 2)

/*
 * Step the stepper motor left or right. 
 * Passing 1 will step left, passing 0 will step right.
 */
void step(int direction)
{
  if (direction != 0 || direction != 1)
  {
    printf("Error: pass step() function 1 or 0 only!\n");
    digitalWrite(relay_pin, 0);
    exit(1);
  }

  /* Write the direction, and pulse the step pin */
  digitalWrite(dir_pin, direction);
  digitalWrite(step_pin, 1);
  digitalWrite(step_pin, 0); 
  delay(100);
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

  /* Turn the handle left, e.g. open the handle */
  int iter = max_steps;
  while (digitalRead(sensor_pin) == LOW || iter > 1)
    step(left); 

  /* Delay for the user to open the door */
  delay(5000);

  /* Turn the handle back to normal, e.g. close the door */
  for (int i = 0; i < num_steps; i++)
    step(right);

  return 0;
}
    
