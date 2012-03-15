LOCAL_PATH := $(call my-dir)
include $(CLEAR_VARS)
LOCAL_MODULE := libjson

LOCAL_SRC_FILES := \
    src/lib_json/json_reader.cpp \
    src/lib_json/json_value.cpp \
    src/lib_json/json_writer.cpp

LOCAL_C_INCLUDES := $(LOCAL_PATH)/include
LOCAL_CFLAGS := -DJSON_USE_EXCEPTION=0

include $(BUILD_SHARED_LIBRARY)

