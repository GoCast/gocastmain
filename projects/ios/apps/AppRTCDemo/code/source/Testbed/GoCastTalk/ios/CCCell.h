#pragma once

#import <UIKit/UIKit.h>

#include <string>

@protocol CCCellDelegate <NSObject>

-(void) onAddPressed;
-(void) onDelPressed:(const size_t&) i;

@end

@interface CCCell : UITableViewCell
{
    id <CCCellDelegate> mDelegate;
    size_t              mIdentifier;
}

-(void) setAsZero:(bool)expanded withLabel:(const std::string&)newLabel;
-(void) setAsNonZero:(size_t)ident withLabel:(const std::string&)newLabel;

-(void) setDelegate:(id <CCCellDelegate>)newDelegate;

@property (nonatomic, strong) IBOutlet UIView       *mContentView;
@property (nonatomic, strong) IBOutlet UILabel      *mTo;
@property (nonatomic, strong) IBOutlet UILabel      *mToPrefix;
@property (nonatomic, strong) IBOutlet UIButton     *mAddButton;
@property (nonatomic, strong) IBOutlet UIButton     *mDelButton;
@property (nonatomic, strong) IBOutlet UIImageView  *mArrowRight;
@property (nonatomic, strong) IBOutlet UIImageView  *mArrowDown;

-(IBAction)addPressed;
-(IBAction)delPressed;

@end
