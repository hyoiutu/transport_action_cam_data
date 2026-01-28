#!/bin/zsh

# 関数定義
## モードに存在するがパターンとしてcaseで分岐していないものをチェックする関数
check_mode_definition() {
  local current_mode="$1"
  shift
  local modes=("$@")

  for mode in "${modes[@]}"; do
    if [ "$current_mode" = "$mode" ]; then
      return 0
    fi
  done
  return 1
}

# メイン関数
test_destination_dir="./test_destination"
rm -rf ${test_destination_dir}/*

modes=('test' 'test_sony' 'test_dji' 'sony' 'dji')
ext_regex="MP4|JPG"

case "$1" in

  test|test_sony)
    echo "this is action cam test mode!"
    
    dir_path="./sony_test_source"
    bkups_dir="./test_destination"
    sed_pattern="s/.*(MAH[0-9]*\.(${ext_regex}))/\1/Ig"
    ;;

  test_dji)
    echo "this is dji test mode!"

    dir_path="./dji_test_source"
    bkups_dir="./test_destination"
    sed_pattern="s/.*(DJI_[0-9]*_[0-9]{4}_D\.(${ext_regex}))/\1/Ig"
    ;;

  sony)
    echo "transporting action cam files!"

    dir_path="/Volumes/Untitled/MP_ROOT/100ANV01"
    bkups_dir="/Volumes/Elements/ActionCam"
    sed_pattern="s/.*(MAH[0-9]*\.(${ext_regex}))/\1/Ig"
    ;;

  dji)
    echo "transporting dji files!"

    dir_path="/Volumes/Untitled/DCIM/DJI_001"
    bkups_dir="/Volumes/Elements/DJI"
    sed_pattern="s/.*(DJI_[0-9]*_[0-9]{4}_D\.(${ext_regex}))/\1/Ig"
    ;;

  *)
    if check_mode_definition "$1" "${modes[@]}"; then
      echo "$1 is existing in modes. but is not defined"
    else
      echo "The argument must be one of the following:"
      for mode in "$modes[@]"; do
        echo "  $mode"
      done
    fi
    exit 1
    ;;
esac

setopt nullglob
video_files=(${dir_path}/*.{MP4,mp4})
image_files=(${dir_path}/*.{JPG,jpg})
unsetopt nullglob

echo "===================    transporting start    ==================="
for full_path in $video_files; do
  echo "------------------ $full_path is transporting now ------------------"

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

  echo "------------------ $full_path is done ------------------"
  
done

for full_path in $image_files; do
  echo "------------------ $full_path is transporting now ------------------"

  creation_date_jst=$(TZ=JST stat -f "%SB" -t "%Y-%m-%d"  ${full_path})
  echo "creation date is ${creation_date_jst}"

  file_name=$(echo ${full_path} | sed -E "$sed_pattern")
  destination="${bkups_dir}/${creation_date_jst}"
  mkdir ${destination}
  echo "dir is ${destination}"

  echo "${file_name} is copying..."
  pv $full_path > ${destination}/${file_name}
  echo "${file_name} copy is done."

  echo "------------------ $full_path is done ------------------"
done

# date -v+9H -j -f "%Y-%m-%dT%H:%M:%S.000000Z" "2022-08-15T23:39:17.000000Z" +"%Y-%m-%d"