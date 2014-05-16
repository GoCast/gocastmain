#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

#include <map>
class JSONValue;
typedef std::map<std::string, JSONValue> JSONObject;

class ChangeLanguageScreen;

@interface ChangeLanguageVC : UIViewController
<
UITableViewDelegate,
UITableViewDataSource
>
{
    ChangeLanguageScreen* mPeer;
}

//mInboxView
@property (nonatomic, strong) IBOutlet UITableView*     mTable;

@property (nonatomic, strong) IBOutlet UILabel*         mChangeLanguageLabel;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(void) popSelf;

@end
