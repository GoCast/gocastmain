#include <android/log.h>

#define GOCAST_LOG_DEBUG(tag, message)  __android_log_write(ANDROID_LOG_DEBUG, tag, message)
#define GOCAST_LOG_ERROR(tag, message)  __android_log_write(ANDROID_LOG_ERROR, tag, message)

