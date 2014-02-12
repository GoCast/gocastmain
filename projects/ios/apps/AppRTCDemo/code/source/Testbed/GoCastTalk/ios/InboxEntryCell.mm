#import "InboxEntryCell.h"

@implementation InboxEntryCell

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

-(void) setTranscription:(const std::string&)newTr
{
    self.mTranscription.text = [NSString stringWithUTF8String:newTr.c_str()];

    self.mTranscription.numberOfLines = 0;
    [self.mTranscription sizeToFit];

    if (floor(NSFoundationVersionNumber) <= NSFoundationVersionNumber_iOS_6_1)
    {
        CGRect r = self.mTranscription.frame;

        r.size.width    = 255;
        r.size.height   = 14;

        [self.mTranscription setFrame:r];
    }
}

@end
