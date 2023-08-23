## Setup of the initial large datafiles

#install.packages("googledrive")
#install.packages("here")
library(googledrive)
library(here)

#------------------------------------------------------------
# 1 - ###Import SVG files
#------------------------------------------------------------
## Import SVG files from Google Drive [ ]

#specify IDS from Google Drive, saved 2018 & 2019
SVG_images_folder <- c("https://drive.google.com/drive/folders/1W5wm15mmJSdHKwxhYj8b1CM7zA3_Az9k")

#to avoid error
# Caused by error in `gargle::response_process()`:
#   ! Client error: (403) Forbidden
# Request had insufficient authentication scopes.
# PERMISSION_DENIED
#run  '> googledrive::drive_deauth()'

SVG_images_folder_ID<-drive_get(as_id(SVG_images_folder))

SVG_images_files = drive_ls(SVG_images_folder_ID)

# drive_download(SVG_images_files, 
#                path = paste0(here("website/SVG_images", SVG_images_folder_$name)),
#                overwrite = TRUE)

SVG_images_files %>% 
  split(SVG_images_files$id) %>% 
  purrr::walk(~drive_download(.$id, path = paste0(here("website/SVG_images", .$name)), overwrite = TRUE))

#or a specific file (i.e. #1 the first one in the list)
SVG_images_files[1] %>% 
  split(SVG_images_files$id) %>% 
  purrr::walk(~drive_download(.$id, path = paste0(here("website/SVG_images", .$name)), overwrite = TRUE))
