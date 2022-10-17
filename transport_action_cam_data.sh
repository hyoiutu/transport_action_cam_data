#!/bin/zsh

echo "Hello, World"

files=($(ls /Volumes/Untitled/MP_ROOT/100ANV01/*.MP4))

echo $files[2,4]

for file in $files; do
  echo $(ffprobe -loglevel quiet ${file} -show_streams | grep -m1 "TAG:creation_time=" | sed -E 's/TAG:creation_time=(20[0-9][0-9]-[01][0-9]-[0-3][0-9]).*/\1/g')
done

