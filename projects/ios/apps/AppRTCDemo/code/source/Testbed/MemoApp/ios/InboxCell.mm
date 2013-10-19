#import "InboxCell.h"

@implementation InboxCell

- (id)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier
{
    self = [super initWithStyle:style reuseIdentifier:reuseIdentifier];

    mStarOn = false;

    return self;
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated
{
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

-(IBAction) starPressed:(id)sender
{
#pragma unused(sender)
    mStarOn = !mStarOn;

    if (mStarOn)
    {
        [self.mStar setBackgroundImage:[UIImage imageNamed:@"inbox_star_on.png"] forState:UIControlStateNormal];
    }
    else
    {
        [self.mStar setBackgroundImage:[UIImage imageNamed:@"inbox_star_off.png"] forState:UIControlStateNormal];
    }
}

@end
