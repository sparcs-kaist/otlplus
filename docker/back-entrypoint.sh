#!/bin/bash

while ! nc "db" 3306; do  
  >&2 echo "MySQL is unavailable - sleeping"
  sleep 1
done

echo "MySQL is up - executing command"  
