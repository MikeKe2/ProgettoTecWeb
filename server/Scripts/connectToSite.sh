#!/bin/bash

export PATH="$PATH:/home/mike/Scripts"

sshpass -p 'PASSWORD' ssh nome.cognome@benes.cs.unibo.it -t "cd /home/web/site181993/html/; bash "
