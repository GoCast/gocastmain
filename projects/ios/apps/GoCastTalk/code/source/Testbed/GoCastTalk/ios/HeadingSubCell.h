#pragma once

#import <UIKit/UIKit.h>

@interface HeadingSubCell : UITableViewCell
{
}

@property (nonatomic, strong) IBOutlet UILabel *mHeading;
@property (nonatomic, strong) IBOutlet UILabel *mSub;
@property (nonatomic, strong) IBOutlet UIImageView *mRightArrow;
@property (nonatomic, strong) IBOutlet UIImageView *mCheckbox;
@property (nonatomic, strong) IBOutlet UIImageView *mNoCheckbox;
@property (nonatomic, strong) IBOutlet UIView *mContentView;

@end
