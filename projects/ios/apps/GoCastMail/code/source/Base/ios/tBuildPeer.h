#pragma once

#pragma mark - Determine build flags for this target

#if DEBUG
#define tBUILD tBUILD_DEBUG
#else
#define tBUILD tBUILD_FINAL
#define NDEBUG 1
#endif

#define tENDIAN tENDIAN_LITTLE_ENDIAN

#define tPLATFORM tPLATFORM_IOS

