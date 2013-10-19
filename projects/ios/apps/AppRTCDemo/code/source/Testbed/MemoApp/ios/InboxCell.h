#pragma once

#import <UIKit/UIKit.h>

@interface InboxCell : UITableViewCell
{
    bool mStarOn;
}
@property (nonatomic, strong) IBOutlet UILabel *mFrom;
@property (nonatomic, strong) IBOutlet UILabel *mDate;
@property (nonatomic, strong) IBOutlet UILabel *mDescription;
@property (nonatomic, strong) IBOutlet UIImageView *mProfileImage;
@property (nonatomic, strong) IBOutlet UIImageView *mIcon;
@property (nonatomic, strong) IBOutlet UIButton *mStar;

-(IBAction) starPressed:(id)sender;

@end
