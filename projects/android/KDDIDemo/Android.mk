LOCAL_PATH := $(call my-dir)
include $(CLEAR_VARS)
LOCAL_MODULE_TAGS := test

LOCAL_SRC_FILES := \
    src/com/gocast/kddidemo/KDDIDemoActivity.java \
    src/com/gocast/kddidemo/CaptureCapabilityAndroid.java \
    src/com/gocast/kddidemo/VideoCaptureAndroid.java \
    src/com/gocast/kddidemo/VideoCaptureDeviceInfoAndroid.java \
    src/com/gocast/kddidemo/ViEAndroidGLES20.java \
    src/com/gocast/kddidemo/ViERenderer.java \
    src/com/gocast/kddidemo/ViESurfaceRenderer.java

LOCAL_PACKAGE_NAME := android-kddidemo
LOCAL_CERTIFICATE := platform
LOCAL_JNI_SHARED_LIBRARIES := libandroid-kddidemo

include $(BUILD_PACKAGE)
include $(call all-makefiles-under,$(LOCAL_PATH))

