#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

#include <map>
class JSONValue;
typedef std::map<std::string, JSONValue> JSONObject;

@interface AboutVC : UIViewController
<
    UITableViewDelegate,
    UITableViewDataSource
>
{
}

//mInboxView
@property (nonatomic, strong) IBOutlet UIScrollView*    mScrollView;
@property (nonatomic, strong) IBOutlet UILabel*         mBuildDate;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

#pragma mark -

-(void) popSelf;

@end
