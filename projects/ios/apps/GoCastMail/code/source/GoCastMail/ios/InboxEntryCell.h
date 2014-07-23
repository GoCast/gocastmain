#pragma once

#import <UIKit/UIKit.h>

#include <string>

@interface InboxEntryCell : UITableViewCell
{
}

@property (nonatomic, strong) IBOutlet UILabel *mFrom;
@property (nonatomic, strong) IBOutlet UILabel *mDate;
@property (nonatomic, strong) IBOutlet UILabel *mTranscription;
@property (nonatomic, strong) IBOutlet UIImageView *mStatusIcon;
@property (nonatomic, strong) IBOutlet UIView *mContentView;

-(void) setTranscription:(const std::string&)newTr;

@end
