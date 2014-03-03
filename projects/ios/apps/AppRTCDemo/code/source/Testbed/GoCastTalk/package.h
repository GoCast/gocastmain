#pragma once

//#define kAmiVoiceAcceptURL "http://amivoiceap.cloudapp.net/api/accept.php"
//#define kAmiVoiceReplyURL "https://chat.gocast.it/memoappserver/amivoice-reply.php"
//#define kMemoAppServerRealURL "https://chat.gocast.it/memoappserver/"
//#ifdef ADHOC
//#define kMemoAppServerURL "https://chat.gocast.it/memoappserver/"
//#else
//#define kMemoAppServerURL "http://127.0.0.1:8888/"
//#endif

#define kMemoAppServerURL LoginScreen::mBaseURL.c_str()

#include <string>
#include <map>
#include <set>

#include "JSONUtil.h"
#include "URLLoader.h"

#include "GCTEvent.h"
#include "GCTEventManager.h"

//Screens

#include "LoginScreen.h"

#include "InboxScreen.h"
#include "InboxMessageScreen.h"
#include "RecordMessageScreen.h"
#include "MessageHistoryScreen.h"

#include "ContactsScreen.h"
#include "EditContactsScreen.h"

#include "SettingsScreen.h"
#include "ChangeRegisteredNameScreen.h"
#include "CreateContactScreen.h"

#include "GroupViewScreen.h"
#include "EditAllGroupsScreen.h"

#include "ios/AppDelegate.h"

extern AppDelegate* gAppDelegateInstance;

