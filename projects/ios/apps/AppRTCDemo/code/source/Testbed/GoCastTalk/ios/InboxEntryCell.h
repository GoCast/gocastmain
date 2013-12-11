#pragma once

#import <UIKit/UIKit.h>

@interface InboxEntryCell : UITableViewCell
{
}

@property (nonatomic, strong) IBOutlet UILabel *mFrom;
@property (nonatomic, strong) IBOutlet UILabel *mDate;
@property (nonatomic, strong) IBOutlet UILabel *mTranscription;
@property (nonatomic, strong) IBOutlet UIImageView *mStatusIcon;

@end
