#pragma once

#define kMemoAppServerURL LoginScreen::mBaseURL.c_str()

#include "GoogleAnalytics.h"

#include <string>
#include <map>
#include <set>

#include "JSONUtil.h"
#include "URLLoader.h"

#include "I18N.h"

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
#include "EditOneGroupScreen.h"

#include "ChangePasswordScreen.h"
#include "ChangeLanguageScreen.h"

#include "ios/AppDelegate.h"

extern AppDelegate* gAppDelegateInstance;

