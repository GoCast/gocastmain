LOCAL_PATH := $(call my-dir)
include $(CLEAR_VARS)
LOCAL_MODULE_TAGS := test

LOCAL_SRC_FILES := src/com/gocast/pctest/PeerConnectionTestActivity.java

LOCAL_PACKAGE_NAME := android-peerconnection-test
LOCAL_CERTIFICATE := platform
LOCAL_JNI_SHARED_LIBRARIES := libandroid-peerconnection-test

include $(BUILD_PACKAGE)
include $(call all-makefiles-under,$(LOCAL_PATH))

