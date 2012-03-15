LOCAL_PATH := $(call my-dir)
include $(CLEAR_VARS)
LOCAL_MODULE := libexpat

LOCAL_SRC_FILES := \
    files/lib/xmlparse.c \
    files/lib/xmlrole.c \
    files/lib/xmltok.c

LOCAL_CFLAGS := \
    -Wall \
    -Wmissing-prototypes \
    -Wstrict-prototypes \
    -DHAVE_EXPAT_CONFIG_H

LOCAL_C_INCLUDES := $(LOCAL_PATH)/files/lib

include $(BUILD_SHARED_LIBRARY)

