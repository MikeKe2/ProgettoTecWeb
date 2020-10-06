#!/bin/bash

export PATH="$PATH:/home/mike/Scripts"

sshpass -p 'PASSWORD' scp -r /home/mike/Documents/Tecnologie_Web/TransferringShit/*  nome.cognome@benes.cs.unibo.it:/home/web/site181993/html/

echo 'File sent'

read -p 'Starting gocker? [y,n] ' yes

case $yes in
	y|Y|yes)	sshpass -p 'PASSWORD' ssh nome.cognome@benes.cs.unibo.it -t "cd /home/web/site181993/html/; ssh gocker.cs.unibo.it";;
	n|N|no)	echo "no";;
	*)	echo "don't known";;
esac

exit 1;
