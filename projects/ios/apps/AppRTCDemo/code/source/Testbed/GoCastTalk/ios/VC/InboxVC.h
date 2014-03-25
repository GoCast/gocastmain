#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

#include <map>
class JSONValue;
typedef std::map<std::string, JSONValue> JSONObject;

class InboxScreen;

@interface InboxVC : UIViewController
<
    UITableViewDelegate,
    UITableViewDataSource
>
{
    InboxScreen* mPeer;
}

//mInboxView
@property (nonatomic, strong) IBOutlet UITableView*     mTable;
@property (nonatomic, strong) IBOutlet UIView*          mBlockingView;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(void)setBlockingViewVisible:(bool)newVisible;

#pragma mark -

-(void) reloadTable;
-(void) pushInboxMessage:(const JSONObject&)newObject;
-(void) pushLoginScreen;

-(void) resetAllTabs;
-(void) switchToInboxTab;

-(void)refresh:(UIRefreshControl *)refreshControl;

@end
