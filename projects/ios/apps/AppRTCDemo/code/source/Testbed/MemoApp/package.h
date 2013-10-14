#pragma once

#define kMemoAppServerURL "http://terencejgrant.com/memoappserver/index.php"

#include <string>
#include <map>

#include "JSONUtil.h"
#include "URLLoader.h"

#include "Screen.h"
#include "RecordAudioScreen.h"
#include "PlayAudioScreen.h"
#include "MyRecordingsScreen.h"
#include "SettingsScreen.h"
#include "StartScreen.h"
#include "SendToGroupScreen.h"

#include "MemoApp.h"

#include "MemoEvent.h"
#include "MemoEventManager.h"

#include "ios/AppDelegate.h"

extern AppDelegate* gAppDelegateInstance;
