#pragma once

//Define the following:
//tBUILD, tENDIAN, tPLATFORM

#ifdef WIN32
#pragma warning (disable : 4068) // Disable "unknown pragma" warnings
#endif

#pragma mark - Defines

#define tBUILD_DEBUG    1
#define tBUILD_PARTIAL  2
#define tBUILD_FINAL    3

#define tENDIAN_LITTLE_ENDIAN   1
#define tENDIAN_BIG_ENDIAN      2

#define tPLATFORM_MAC           1
#define tPLATFORM_IOS           2
#define tPLATFORM_WIN           3

#pragma mark - Determine build flags for this target
#include "tBuildPeer.h"

#pragma mark - Based on build flags, set some logic

#if tBUILD != tBUILD_FINAL
#include <assert.h>
#else
#ifdef assert
#undef assert
#endif
#define assert(x) { }
#endif

