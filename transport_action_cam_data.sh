#!/bin/zsh

bkups_dir="/Volumes/Elements/ActionCam"
files=($(ls /Volumes/Untitled/MP_ROOT/100ANV01/*.MP4))

for full_path in $files; do
  creation_date=$(ffprobe -loglevel quiet ${full_path} -show_streams | grep -m1 "TAG:creation_time=" | sed -E 's/TAG:creation_time=(20[0-9][0-9]-[01][0-9]-[0-3][0-9]).*/\1/g')
  echo "creation date is ${creation_date}"

  file_name=$(echo ${full_path} | sed -E 's/.*(MAH[0-9]*\.MP4)/\1/g')
  destination="${bkups_dir}/${creation_date}"
  mkdir ${destination}
  echo "dir is ${destination}"

  echo "${file_name} is copying..."
  pv $full_path > ${destination}/${file_name}
  echo "${file_name} copy is done."
done

