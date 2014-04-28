#include "ChangeRegisteredNameVC.h"

#include "Base/package.h"
#include "Io/package.h"
#include "Math/package.h"

#include "GoCastTalk/package.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"

@interface ChangeRegisteredNameVC()
{
}
@end

@implementation ChangeRegisteredNameVC

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    [super viewDidLoad];

    self.view.autoresizesSubviews = YES;
    self.view.opaque = NO;

    self->mPickedIndex = 0;

    mPeer = new ChangeRegisteredNameScreen(self, mInitObject);

    self.mKanji.text    = [NSString stringWithUTF8String:mInitObject["kanji"].mString.c_str()];
    self.mKana.text     = [NSString stringWithUTF8String:mInitObject["kana"].mString.c_str()];

    [self setPickerViewVisible:false];

    CGRect r = self.mPicker.frame;
    r.origin.y  = gAppDelegateInstance->mScreenHeight;
    r.origin.y -= gAppDelegateInstance->mTabBarHeight;
    r.origin.y -= gAppDelegateInstance->mStatusBarHeight;
    r.origin.y -= gAppDelegateInstance->mNavBarHeight;
    r.origin.y -= self.mPickerType.frame.origin.y;
    r.origin.y -= r.size.height;

    [self.mPicker setFrame:r];

    CGRect q = self.mAbovePickerView.frame;
    q.origin.y = r.origin.y - 30;
    [self.mAbovePickerView setFrame:q];

    if (mInitObject["email"].mType == JSONValue::kString)
    {
        self.mEmail.text        = [NSString stringWithUTF8String:mInitObject["email"].mString.c_str()];
    }
    else if (mInitObject["email"].mType == JSONValue::kJSONArray)
    {
        if (!mInitObject["email"].mArray.empty())
        {
            [self setPickerViewVisible:true];

            self.mEmail.text    = [NSString stringWithUTF8String:mInitObject["email"].mArray[0].mString.c_str()];
        }
    }
}

- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
}

- (void)dealloc
{
    delete mPeer;

    [super dealloc];
}

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
#pragma unused(tableView, section)

    if (tableView == self.mTable)
    {
        return (NSInteger)3;
    }

    return (NSInteger)1;
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    [cell setBackgroundColor:[UIColor whiteColor]];
}

-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(indexPath)
    const char* names[1] =
    {
        "Unimplemented",
    };

    if (tableView == self.mTable)
    {
        const char* from[] =
        {
            "Sato Taro",
            "Yamada Hanako",
            "Planning 2",
        };

        const char* date[] =
        {
            "12/21 12:24",
            "12/20 12:12",
            "12/18 11:43",
        };

        const char* transcription[] =
        {
            "「知りません。日本語で何か…",
            "「でもでもそんなの関係ねえ…",
            "「ニューヨークで入浴…",
        };

        const bool recv[] =
        {
            true,
            false,
            false,
        };

        const bool isGroup[] =
        {
            false,
            false,
            true,
        };

        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"InboxEntryCell";

        InboxEntryCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[InboxEntryCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.mFrom.text = [NSString stringWithUTF8String:from[indexPath.row]];
        cell.mDate.text = [NSString stringWithUTF8String:date[indexPath.row]];
        [cell setTranscription:transcription[indexPath.row]];
        cell.mStatusIcon.image = [UIImage imageNamed:(recv[indexPath.row] ? @"icon-receive.png" : @"icon-sent.png")];
        cell.mFrom.textColor =  isGroup[indexPath.row] ?
            [UIColor colorWithRed:0.0f green:0.47f blue:1.0f alpha:1.0f] :
            [UIColor colorWithRed:0.0f green:0.0f  blue:0.0f alpha:1.0f];

        return cell;
    }
    else
    {
        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"TableItem";

        UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.textLabel.text = [NSString stringWithUTF8String:names[0]];

        cell.imageView.image = nil;

        return cell;
    }
}

-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
}

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    return NO;
}

// Override to support editing the table view.
- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    if (editingStyle == UITableViewCellEditingStyleDelete)
    {
//        if (tableView == self.mTable)
//        {
//            GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kTableItemDeleted, (tUInt32)indexPath.row));
//        }
    }
}

-(void)textFieldDidBeginEditing:(UITextField *)textField
{
    if (textField == self.mKanji)
    {
        [self.mScrollView setContentOffset:CGPointMake(0, self.mKanji.frame.origin.y - 64) animated:YES];
    }
    else if (textField == self.mKana)
    {
        [self.mScrollView setContentOffset:CGPointMake(0, self.mKana.frame.origin.y - 64) animated:YES];
    }
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField
{
#pragma unused(textField)
    [textField endEditing:YES];
    [self.mScrollView setContentOffset:CGPointMake(0, -64) animated:YES];
    return YES;
}

// returns the number of 'columns' to display.
- (NSInteger)numberOfComponentsInPickerView:(UIPickerView *)pickerView
{
#pragma unused(pickerView)

    return 1;
}

// returns the # of rows in each component..
- (NSInteger)pickerView:(UIPickerView *)pickerView numberOfRowsInComponent:(NSInteger)component
{
#pragma unused(pickerView, component)
    if (mInitObject["email"].mType == JSONValue::kJSONArray)
    {
        return (NSInteger)mInitObject["email"].mArray.size();
    }

    return 1;
}

- (NSString *)pickerView:(UIPickerView *)pickerView titleForRow:(NSInteger)row forComponent:(NSInteger)component
{
#pragma unused(pickerView, row, component)
    if (mInitObject["email"].mType == JSONValue::kJSONArray)
    {
        return [NSString stringWithUTF8String:mInitObject["email"].mArray[(size_t)row].mString.c_str()];
    }

    return [NSString stringWithUTF8String:mInitObject["email"].mString.c_str()];
}

- (void)pickerView:(UIPickerView *)pickerView didSelectRow:(NSInteger)row inComponent:(NSInteger)component
{
#pragma unused(pickerView, component)
    self->mPickedIndex = (size_t)row;
}

-(void)setPickerViewVisible:(bool)newVisible
{
    [self.mPickerType setHidden:newVisible ? NO : YES];
    [self.mNonPickerType setHidden:newVisible ? YES : NO];
}

-(void)setBlockingViewVisible:(bool)newVisible
{
    [self.mBlockingView setHidden:newVisible ? NO : YES];
}

-(void) popSelf
{
    [(UINavigationController*)self.parentViewController popViewControllerAnimated:TRUE];
}

-(void)customInit:(const JSONObject&)newObject
{
    mInitObject = newObject;
}

-(IBAction)savePressed
{
    const char* kanji   = [self.mKanji.text UTF8String];
    const char* kana    = [self.mKana.text  UTF8String];

    mInitObject["kanji"]    = JSONValue(kanji ? kanji : std::string(""));
    mInitObject["kana"]     = JSONValue(kana  ? kana  : std::string(""));

    if (mInitObject["email"].mType == JSONValue::kJSONArray)
    {
        mInitObject["email"] = JSONValue(mInitObject["email"].mArray[self->mPickedIndex]);
    }

    mPeer->savePressed(mInitObject);
}

@end
