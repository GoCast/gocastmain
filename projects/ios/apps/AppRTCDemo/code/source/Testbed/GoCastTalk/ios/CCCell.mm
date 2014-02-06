#import "CCCell.h"

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

-(void) setAsZero:(bool)expanded
{
    self->mIdentifier = 0;

    self.mTo.text = [NSString stringWithUTF8String:"to: ..."];

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

    [self.mArrowRight setHidden:YES];
    [self.mArrowDown setHidden:YES];
    [self.mAddButton setHidden:YES];
    [self.mDelButton setHidden:NO];
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
