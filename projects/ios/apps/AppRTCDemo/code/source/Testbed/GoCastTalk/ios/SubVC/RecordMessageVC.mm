#include "RecordMessageVC.h"

#include "Base/package.h"
#include "Io/package.h"

#include "Testbed/GoCastTalk/package.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"

@interface RecordMessageVC()
{
}
@end

@implementation RecordMessageVC

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    [super viewDidLoad];

    [self.mTable registerNib:[UINib nibWithNibName:@"HeadingSubCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"HeadingSubCell"];

    self.view.autoresizesSubviews = YES;

    mPeer = new RecordMessageScreen(self, mInitObject);

    self.mToLabel.text = [NSString stringWithUTF8String:("to: " + mPeer->getTo()).c_str()];
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
        return (NSInteger)2;
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
        const char* heading[] =
        {
            "Done, Send",
            "Cancel and Delete",
        };

        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"HeadingSubCell";

        HeadingSubCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[HeadingSubCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.mHeading.text = [NSString stringWithUTF8String:heading[indexPath.row]];
        cell.mSub.text = [NSString stringWithUTF8String:""];
        cell.mRightArrow.hidden = YES;
        
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
    switch (indexPath.row)
    {
        case 0: mPeer->donePressed(); break;
        case 1: mPeer->cancelPressed(); break;

        default:
            break;
    }
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

-(void)setBlockingViewVisible:(bool)newVisible
{
    [self.mBlockingView setHidden:newVisible ? NO : YES];
}

-(IBAction)pausePressed
{
    mPeer->pausePressed();
}

-(IBAction)recordPressed
{
    mPeer->recordPressed();
}

-(IBAction)playPressed
{
    mPeer->playPressed();
}

-(void)customInit:(const JSONObject&)newObject
{
    mInitObject = newObject;
}

-(void)popSelf
{
    [(UINavigationController*)self.parentViewController popViewControllerAnimated:TRUE];
}

-(void) setWaitToRecordUI
{
    [self.mPauseButton  setEnabled:NO];
    [self.mRecordButton setEnabled:YES];
    [self.mPlayButton   setEnabled:NO];
}

-(void) setWaitToPlayUI
{
    [self.mPauseButton  setEnabled:NO];
    [self.mRecordButton setEnabled:NO];
    [self.mPlayButton   setEnabled:YES];
}

-(void) setPlayingUI
{
    [self.mPauseButton  setEnabled:YES];
    [self.mRecordButton setEnabled:NO];
    [self.mPlayButton   setEnabled:NO];
}

-(void) setPausedUI
{
    [self.mPauseButton  setEnabled:NO];
    [self.mRecordButton setEnabled:NO];
    [self.mPlayButton   setEnabled:YES];
}

-(void) setRecordingUI
{
    [self.mPauseButton  setEnabled:NO];
    [self.mRecordButton setEnabled:YES];
    [self.mPlayButton   setEnabled:NO];
}

-(void) setWaitForTranscriptUI
{
    [self.mPauseButton  setEnabled:NO];
    [self.mRecordButton setEnabled:NO];
    [self.mPlayButton   setEnabled:NO];
}

@end

