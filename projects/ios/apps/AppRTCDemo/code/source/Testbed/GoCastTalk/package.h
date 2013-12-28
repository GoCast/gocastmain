#pragma once

#define kAmiVoiceAcceptURL "http://amivoiceap.cloudapp.net/api/accept.php"
#define kAmiVoiceReplyURL "http://terencejgrant.com/memoappserver/amivoice-reply.php"
#define kMemoAppServerRealURL "http://terencejgrant.com/memoappserver/"
#ifdef ADHOC
#define kMemoAppServerURL "http://terencejgrant.com/memoappserver/"
#else
#define kMemoAppServerURL "http://127.0.0.1:8888/"
#endif

#include <string>
#include <map>
#include <set>

#include "JSONUtil.h"
#include "URLLoader.h"

#include "Tab.h"

#include "InboxTab.h"
#include "NewMemoTab.h"
#include "ContactsTab.h"
#include "GroupsTab.h"
#include "SettingsTab.h"

#include "GoCastTalkApp.h"

#include "GCTEvent.h"
#include "GCTEventManager.h"

#include "ios/AppDelegate.h"

extern AppDelegate* gAppDelegateInstance;

