#!/bin/zsh

if [ $1 = "test"  -o $1 = "test_sony" ]; then
  echo "this is action cam test mode!"

  bkups_dir="./test_destination"
  files=($(ls ./sony_test_source/*.MP4))
  sed_pattern='s/.*(MAH[0-9]*\.MP4)/\1/g'

  rm -rf "${bkups_dir}/*"
elif [ $1 = "test_dji" ]; then
  echo "this is dji test mode!"

  bkups_dir="./test_destination"
  files=($(ls ./dji_test_source/*.MP4))
  sed_pattern='s/.*(DJI_[0-9]*_[0-9]{4}_D\.MP4)/\1/g'

  rm -rf "${bkups_dir}/*"
elif [ $1 = "sony" ]; then
  echo "transporting action cam files!"

  bkups_dir="/Volumes/Elements/ActionCam"
  files=($(ls /Volumes/Untitled/MP_ROOT/100ANV01/*.MP4))
  sed_pattern='s/.*(MAH[0-9]*\.MP4)/\1/g'
elif [ $1 = "dji" ]; then
  echo "transporting dji files!"

  bkups_dir="/Volumes/Elements/DJI"
  files=($(ls /Volumes/Untitled/DCIM/DJI_001/*.MP4))
  sed_pattern='s/.*(DJI_[0-9]*_[0-9]{4}_D\.MP4)/\1/g'
else
  echo "arg must be 'test', 'test_sony', 'test_dji', 'sony' or 'dji'."
  exit 1
fi



for full_path in $files; do
  creation_datetime_gmt=$(ffprobe -loglevel quiet ${full_path} -show_streams | grep -m1 "TAG:creation_time=" | sed -E 's/TAG:creation_time=(20[0-9][0-9]-[01][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]\.000000Z).*/\1/g')
  [ -z ${creation_datetime_gmt} ] && echo "creation_datetime_gmt is undefined" && exit 1
  creation_date_jst=$(date -v+9H -j -f "%Y-%m-%dT%H:%M:%S.000000Z" "${creation_datetime_gmt}" +"%Y-%m-%d")
  echo "creation date is ${creation_date_jst}"

  file_name=$(echo ${full_path} | sed -E "$sed_pattern")
  destination="${bkups_dir}/${creation_date_jst}"
  mkdir ${destination}
  echo "dir is ${destination}"

  echo "${file_name} is copying..."
  pv $full_path > ${destination}/${file_name}
  echo "${file_name} copy is done."
done

# date -v+9H -j -f "%Y-%m-%dT%H:%M:%S.000000Z" "2022-08-15T23:39:17.000000Z" +"%Y-%m-%d"