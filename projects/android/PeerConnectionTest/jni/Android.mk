JNI_DIR := $(call my-dir)
WEBRTC_DIR := deps/webrtc/trunk

# libwebrtc
include $(JNI_DIR)/$(WEBRTC_DIR)/Android.mk

# libexpat
include $(JNI_DIR)/$(WEBRTC_DIR)/third_party/expat/Android.mk

# libjson
include $(JNI_DIR)/$(WEBRTC_DIR)/third_party/jsoncpp/Android.mk

# libjingle
include $(JNI_DIR)/$(WEBRTC_DIR)/third_party/libjingle/source/talk/Android.mk

LOCAL_PATH := jni
include $(CLEAR_VARS)
LOCAL_ARM_MODE := arm
LOCAL_MODULE := libandroid-peerconnection-test
LOCAL_MODULE_TAGS := optional

LOCAL_CPP_EXTENSION := .cpp
LOCAL_SRC_FILES := src/noop.cpp
LOCAL_CFLAGS := \
    '-DPOSIX' \
    '-DWEBRTC_ANDROID' \
    '-DWEBRTC_RELATIVE_PATH'

LOCAL_C_INCLUDES := \
    $(LOCAL_PATH)/deps/webrtc/trunk/src \
    $(LOCAL_PATH)/deps/webrtc/trunk/third_party/libjingle/source \
    $(LOCAL_PATH)/deps/webrtc/trunk/third_party_mods/libjingle/source

LOCAL_WHOLE_STATIC_LIBRARIES := \
    libjingle

LOCAL_SHARED_LIBRARIES := \
    libcutils \
    libdl \
    libstlport \
    libandroid \
    libwebrtc \
    libexpat \
    libjson
#    libjpeg \
#    libGLESv2 \
#    libOpenSLES

LOCAL_LDLIBS := -llog
LOCAL_PRELINK_MODULE := false
include $(BUILD_SHARED_LIBRARY)

