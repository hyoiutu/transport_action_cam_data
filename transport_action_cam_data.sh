#!/bin/zsh

if [ $1 = "test" ]; then
  echo "this is test mode!"

  bkups_dir="./test_destination"
  files=($(ls ./test_source/*.MP4))

  rm -rf "${bkups_dir}/*"
elif [ $1 = "prod" ]; then
  echo "this is procution mode!"

  bkups_dir="/Volumes/Elements/ActionCam"
  files=($(ls /Volumes/Untitled/MP_ROOT/100ANV01/*.MP4))
else
  echo "arg must be 'test' or 'prod.'"
  exit 1
fi



for full_path in $files; do
  creation_date=$(ffprobe -loglevel quiet ${full_path} -show_streams | grep -m1 "TAG:creation_time=" | sed -E 's/TAG:creation_time=(20[0-9][0-9]-[01][0-9]-[0-3][0-9]).*/\1/g')
  [ -z ${creation_date} ] && echo "creation_date is undefined" && exit 1
  echo "creation date is ${creation_date}"

  file_name=$(echo ${full_path} | sed -E 's/.*(MAH[0-9]*\.MP4)/\1/g')
  destination="${bkups_dir}/${creation_date}"
  mkdir ${destination}
  echo "dir is ${destination}"

  echo "${file_name} is copying..."
  pv $full_path > ${destination}/${file_name}
  echo "${file_name} copy is done."
done

# date -v+9H -j -f "%Y-%m-%dT%H:%M:%S.000000Z" "2022-08-15T23:39:17.000000Z" +"%Y-%m-%d"