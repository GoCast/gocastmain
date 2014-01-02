#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

@interface ContactsVC : UIViewController
<
    UITableViewDelegate,
    UITableViewDataSource
>
{
}

//mInboxView
@property (nonatomic, strong) IBOutlet UITableView*     mTable;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(IBAction)helpButton:(UIBarButtonItem*)sender;

@end
