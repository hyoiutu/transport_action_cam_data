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
  creation_datetime_gmt=$(ffprobe -loglevel quiet ${full_path} -show_streams | grep -m1 "TAG:creation_time=" | sed -E 's/TAG:creation_time=(20[0-9][0-9]-[01][0-9]-[0-3][0-9]T[0-1][0-9]:[0-5][0-9]:[0-5][0-9]\.000000Z).*/\1/g')
  [ -z ${creation_datetime_gmt} ] && echo "creation_datetime_gmt is undefined" && exit 1
  creation_date_jst=$(date -v+9H -j -f "%Y-%m-%dT%H:%M:%S.000000Z" "${creation_datetime_gmt}" +"%Y-%m-%d")
  echo "creation date is ${creation_date_jst}"

  file_name=$(echo ${full_path} | sed -E 's/.*(MAH[0-9]*\.MP4)/\1/g')
  destination="${bkups_dir}/${creation_date_jst}"
  mkdir ${destination}
  echo "dir is ${destination}"

  echo "${file_name} is copying..."
  pv $full_path > ${destination}/${file_name}
  echo "${file_name} copy is done."
done

# date -v+9H -j -f "%Y-%m-%dT%H:%M:%S.000000Z" "2022-08-15T23:39:17.000000Z" +"%Y-%m-%d"