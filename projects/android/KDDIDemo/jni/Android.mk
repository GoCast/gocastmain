JNI_DIR := $(call my-dir)
WEBRTC_DIR := deps/webrtc/trunk

# libwebrtc
include $(JNI_DIR)/$(WEBRTC_DIR)/Android.mk

LOCAL_PATH := jni
include $(CLEAR_VARS)
LOCAL_ARM_MODE := arm
LOCAL_MODULE := libandroid-kddidemo
LOCAL_MODULE_TAGS := optional

LOCAL_CPP_EXTENSION := .cpp
LOCAL_SRC_FILES := \
    src/kddidemo.cpp \
    src/rtcengine.cpp \
    src/voeinterface.cpp \
    src/vieinterface.cpp

LOCAL_CFLAGS := \
    '-DPOSIX' \
    '-DANDROID' \
    '-DWEBRTC_ANDROID' \
    '-DANDROID_LOG' \
    '-DWEBRTC_RELATIVE_PATH'

LOCAL_C_INCLUDES := \
    $(LOCAL_PATH)/deps/webrtc/trunk/src \
    $(LOCAL_PATH)/deps/webrtc/trunk/src/voice_engine/main/interface \
    $(LOCAL_PATH)/deps/webrtc/trunk/src/video_engine/main/interface \
    $(LOCAL_PATH)/deps/webrtc/trunk/src/modules/video_capture/main/interface \
    $(LOCAL_PATH)/deps/webrtc/trunk/src/modules/video_render/main/interface \
    $(LOCAL_PATH)/deps/webrtc/trunk/src/modules/interface \
    $(LOCAL_PATH)/deps/webrtc/trunk/src/system_wrappers/interface


LOCAL_SHARED_LIBRARIES := \
    libcutils \
    libdl \
    libstlport \
    libandroid \
    libwebrtc

LOCAL_LDLIBS := -llog
LOCAL_PRELINK_MODULE := false
include $(BUILD_SHARED_LIBRARY)

