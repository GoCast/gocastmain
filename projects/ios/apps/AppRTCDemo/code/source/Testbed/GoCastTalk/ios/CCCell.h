#pragma once

#import <UIKit/UIKit.h>

@interface CCCell : UITableViewCell
{
}

@property (nonatomic, strong) IBOutlet UIView   *mContentView;
@property (nonatomic, strong) IBOutlet UILabel  *mTo;
@property (nonatomic, strong) IBOutlet UIButton *mAddButton;
@property (nonatomic, strong) IBOutlet UIButton *mDelButton;
@property (nonatomic, strong) IBOutlet UIImageView  *mArrowRight;
@property (nonatomic, strong) IBOutlet UIImageView  *mArrowDown;

@end
