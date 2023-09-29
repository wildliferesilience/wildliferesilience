## Setup of the initial large datafiles

#install.packages("googledrive")
#install.packages("here")
library(googledrive)
library(here)

#------------------------------------------------------------
# 1 - ###Point to local directories and files 
#------------------------------------------------------------
## Point to local directory 

local_dir_docx<-here("website/converted")

docx_webcontent_files <- list.files(local_dir_docx, recursive = TRUE)


#specify ID in Google Drive to write to
docx_folder <- c("https://drive.google.com/drive/folders/13Injvo2S0946uw1XK2c8jrEFhQRNyOpd")

#to avoid error
# Caused by error in `gargle::response_process()`:
#   ! Client error: (403) Forbidden
# Request had insufficient authentication scopes.
# PERMISSION_DENIED
#run  '> googledrive::drive_deauth()'

purrr::map(
  docx_webcontent_files,
  ~ drive_upload(paste0(local_dir_docx, "/", .x), path = as_dribble(docx_folder))
)
d