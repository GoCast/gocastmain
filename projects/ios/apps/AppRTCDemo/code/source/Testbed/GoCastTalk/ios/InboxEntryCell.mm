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

    self.mTranscription.numberOfLines = 1;
    [self.mTranscription sizeToFit];
}

@end
