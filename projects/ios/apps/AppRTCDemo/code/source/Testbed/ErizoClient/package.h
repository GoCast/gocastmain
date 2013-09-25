#pragma once

#include <queue>
#include <string>
#include <map>

#include "JSONUtil.h"
#include "URLLoader.h"

class ErizoApp;
class ErizoStream;
class ErizoLicodeEvent;

typedef void (*fnPtr)();
typedef void (*fnJSONPtr)(void* that, const std::string&);
typedef void (*fnEventPtr)(void* that, const ErizoLicodeEvent*);

#include "ErizoEvent.h"
#include "ErizoConnection.h"
#include "ErizoRoom.h"
#include "ErizoStream.h"

#include "ErizoStack.h"
#include "ErizoClient.h"

#include "GUIEvent.h"
#include "ErizoApp.h"
