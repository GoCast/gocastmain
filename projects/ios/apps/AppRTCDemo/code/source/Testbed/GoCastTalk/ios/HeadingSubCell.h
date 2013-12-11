#pragma once

#import <UIKit/UIKit.h>

@interface HeadingSubCell : UITableViewCell
{
}

@property (nonatomic, strong) IBOutlet UILabel *mHeading;
@property (nonatomic, strong) IBOutlet UILabel *mSub;
@property (nonatomic, strong) IBOutlet UIImageView *mRightArrow;

@end
