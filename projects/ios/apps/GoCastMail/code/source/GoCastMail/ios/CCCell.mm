#import "CCCell.h"

#include "Base/package.h"

@implementation CCCell

- (id)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier
{
    self = [super initWithStyle:style reuseIdentifier:reuseIdentifier];

    return self;
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated
{
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

-(void) setAsZero:(bool)expanded withLabel:(const std::string&)newLabel
{
    self->mIdentifier = 0;

    self.mTo.text = [NSString stringWithUTF8String:newLabel.c_str()];
    self.mTo.textColor = [UIColor lightGrayColor];

    CGRect r = [self.mToPrefix frame];
    CGRect q = [self.mTo frame];

    q.origin.x = r.origin.x + 36;
    [self.mTo setFrame:q];

    self.mToPrefix.text = [NSString stringWithUTF8String:std::string("to:").c_str()];
    [self.mToPrefix setHidden:NO];

    if (!expanded)
    {
        [self.mArrowRight setHidden:NO];
        [self.mArrowDown setHidden:YES];
    }
    else
    {
        [self.mArrowRight setHidden:YES];
        [self.mArrowDown setHidden:NO];
    }
    [self.mAddButton setHidden:NO];
    [self.mDelButton setHidden:YES];
}

-(void) setAsNonZero:(size_t)ident withLabel:(const std::string&)newLabel
{
    self->mIdentifier = ident;

    self.mTo.text = [NSString stringWithUTF8String:newLabel.c_str()];
    self.mTo.textColor = [UIColor blackColor];

    CGRect r = [self.mToPrefix frame];
    CGRect q = [self.mTo frame];

    q.origin.x = r.origin.x;
    [self.mTo setFrame:q];

    [self.mToPrefix setHidden:YES];

    [self.mArrowRight setHidden:YES];
    [self.mArrowDown setHidden:YES];
    [self.mAddButton setHidden:YES];
    [self.mDelButton setHidden:NO];
}

-(void) noButtons
{
    [self.mAddButton setHidden:YES];
    [self.mDelButton setHidden:YES];
}

-(void) setDelegate:(id <CCCellDelegate>)newDelegate
{
    self->mDelegate = newDelegate;
}

-(IBAction)addPressed
{
    [mDelegate onAddPressed];
}

-(IBAction)delPressed
{
    [mDelegate onDelPressed:self->mIdentifier];
}

@end
