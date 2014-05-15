#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

#include <map>
class JSONValue;
typedef std::map<std::string, JSONValue> JSONObject;

class MessageHistoryScreen;

@interface MessageHistoryVC : UIViewController
<
    UITableViewDelegate,
    UITableViewDataSource
>
{
    JSONObject mInitObject;
    MessageHistoryScreen* mPeer;
}

//mInboxView
@property (nonatomic, strong) IBOutlet UITableView*     mTable;
@property (nonatomic, strong) IBOutlet UITableView*     mOptionsTable;

@property (nonatomic, strong) IBOutlet UIImageView* mReceive;
@property (nonatomic, strong) IBOutlet UILabel*     mFrom;
@property (nonatomic, strong) IBOutlet UILabel*     mDate;
@property (nonatomic, strong) IBOutlet UILabel*     mTranscription;

@property (nonatomic, strong) IBOutlet UILabel*     mHistoryLabel;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(void)customInit:(const JSONObject&)newObject;

-(void) pushInboxMessage:(const JSONObject&)newObject;
-(void) pushRecordMessage:(const JSONObject&)newObject;

@end
