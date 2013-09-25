
#import <UIKit/UIKit.h>

@interface MainViewController
: UIViewController <UIGestureRecognizerDelegate, UITextFieldDelegate, UITableViewDelegate, UITableViewDataSource>
{
}
@property (nonatomic, strong) IBOutlet UILabel* mScreenNameLabel;
@property (nonatomic, strong) IBOutlet UITextField* mScreenName;

@property (nonatomic, strong) IBOutlet UITextField* mRoomName;
@property (nonatomic, strong) IBOutlet UIButton* mRoomNameGo;

@property (nonatomic, strong) IBOutlet UITableView* mUserTable;

-(IBAction)quitPressed:(id)sender;

-(IBAction)buttonPressed:(id)sender;

- (BOOL)textFieldShouldReturn:(UITextField *)textField;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

@end
