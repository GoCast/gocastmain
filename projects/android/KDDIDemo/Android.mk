LOCAL_PATH := $(call my-dir)
include $(CLEAR_VARS)
LOCAL_MODULE_TAGS := test

LOCAL_SRC_FILES := src/com/gocast/kddidemo/KDDIDemoActivity.java

LOCAL_PACKAGE_NAME := android-kddidemo
LOCAL_CERTIFICATE := platform
LOCAL_JNI_SHARED_LIBRARIES := libandroid-kddidemo

include $(BUILD_PACKAGE)
include $(call all-makefiles-under,$(LOCAL_PATH))

