#import "ActionSheetStringPicker.h"

@interface ActionSheetStringPicker()
@property (nonatomic,retain) NSArray *data;
@property (nonatomic,assign) NSInteger selectedIndex;
@end

@implementation ActionSheetStringPicker
@synthesize data = _data;
@synthesize selectedIndex = _selectedIndex;
@synthesize onActionSheetDone = _onActionSheetDone;
@synthesize onActionSheetCancel = _onActionSheetCancel;

+ (id)showPickerWithTitle:(NSString *)title rows:(NSArray *)strings initialSelection:(NSInteger)index doneBlock:(ActionStringDoneBlock)doneBlock cancelBlock:(ActionStringCancelBlock)cancelBlockOrNil origin:(id)origin {
    ActionSheetStringPicker * picker = [[ActionSheetStringPicker alloc] initWithTitle:title rows:strings initialSelection:index doneBlock:doneBlock cancelBlock:cancelBlockOrNil origin:origin];
    [picker showActionSheetPicker];
    return [picker autorelease];
}

- (id)initWithTitle:(NSString *)title rows:(NSArray *)strings initialSelection:(NSInteger)index doneBlock:(ActionStringDoneBlock)doneBlock cancelBlock:(ActionStringCancelBlock)cancelBlockOrNil origin:(id)origin {
    self = [self initWithTitle:title rows:strings initialSelection:index target:nil successAction:nil cancelAction:nil origin:origin];
    if (self) {
        self.onActionSheetDone = doneBlock;
        self.onActionSheetCancel = cancelBlockOrNil;
    }
    return self;
}

+ (id)showPickerWithTitle:(NSString *)title rows:(NSArray *)data initialSelection:(NSInteger)index target:(id)target successAction:(SEL)successAction cancelAction:(SEL)cancelActionOrNil origin:(id)origin {
    ActionSheetStringPicker *picker = [[[ActionSheetStringPicker alloc] initWithTitle:title rows:data initialSelection:index target:target successAction:successAction cancelAction:cancelActionOrNil origin:origin] autorelease];
    [picker showActionSheetPicker];
    return picker;
}

- (id)initWithTitle:(NSString *)title rows:(NSArray *)data initialSelection:(NSInteger)index target:(id)target successAction:(SEL)successAction cancelAction:(SEL)cancelActionOrNil origin:(id)origin {
    self = [self initWithTarget:target successAction:successAction cancelAction:cancelActionOrNil origin:origin];
    if (self) {
        self.data = data;
        self.selectedIndex = index;
        self.title = title;
    }
    return self;
}

- (void)dealloc {
    self.data = nil;
    
    Block_release(_onActionSheetDone);
    Block_release(_onActionSheetCancel);
    
    [super dealloc];
}

- (UIView *)configuredPickerView {
    if (!self.data)
        return nil;
    CGRect pickerFrame = CGRectMake(0, 40, self.viewSize.width, 216);
    UIPickerView *stringPicker = [[[UIPickerView alloc] initWithFrame:pickerFrame] autorelease];
    stringPicker.delegate = self;
    stringPicker.dataSource = self;
    stringPicker.showsSelectionIndicator = YES;
    [stringPicker selectRow:(int)self.selectedIndex inComponent:0 animated:NO];
    
    //need to keep a reference to the picker so we can clear the DataSource / Delegate when dismissing
    self.pickerView = stringPicker;
    
    return stringPicker;
}

- (void)notifyTarget:(id)target didSucceedWithAction:(SEL)successAction origin:(id)origin {    
    if (self.onActionSheetDone) {
        _onActionSheetDone(self, self.selectedIndex, [self.data objectAtIndex:(unsigned int)self.selectedIndex]);
        return;
    }
    else if (target && [target respondsToSelector:successAction]) {
        [target performSelector:successAction withObject:[NSNumber numberWithInt:self.selectedIndex] withObject:origin];
        return;
    }
    NSLog(@"Invalid target/action ( %s / %s ) combination used for ActionSheetPicker", object_getClassName(target), sel_getName(successAction));
}

- (void)notifyTarget:(id)target didCancelWithAction:(SEL)cancelAction origin:(id)origin {
    if (self.onActionSheetCancel) {
        _onActionSheetCancel(self);
        return;
    }
    else if (target && cancelAction && [target respondsToSelector:cancelAction])
        [target performSelector:cancelAction withObject:origin];
}

#pragma mark - UIPickerViewDelegate / DataSource

- (void)pickerView:(UIPickerView *)pickerView didSelectRow:(NSInteger)row inComponent:(NSInteger)component {
#pragma unused(pickerView, component)
    self.selectedIndex = row;
}

- (NSInteger)numberOfComponentsInPickerView:(UIPickerView *)pickerView {
#pragma unused(pickerView)
    return 1;
}

- (NSInteger)pickerView:(UIPickerView *)pickerView numberOfRowsInComponent:(NSInteger)component {
#pragma unused(pickerView, component)

    return (int)self.data.count;
}

- (NSString *)pickerView:(UIPickerView *)pickerView titleForRow:(NSInteger)row forComponent:(NSInteger)component {
#pragma unused(pickerView, component)
    return [self.data objectAtIndex:(unsigned int)row];
}

- (CGFloat)pickerView:(UIPickerView *)pickerView widthForComponent:(NSInteger)component {
#pragma unused(component)
    return pickerView.frame.size.width - 30;
}

#pragma mark - Block setters

    // NOTE: Sometimes see crashes when relying on just the copy property. Using Block_copy ensures correct behavior

- (void)setOnActionSheetDone:(ActionStringDoneBlock)onActionSheetDone {
    if (_onActionSheetDone) {
        Block_release(_onActionSheetDone);
        _onActionSheetDone = nil;
    }
    _onActionSheetDone = Block_copy(onActionSheetDone);
}

- (void)setOnActionSheetCancel:(ActionStringCancelBlock)onActionSheetCancel {
    if (_onActionSheetCancel) {
        Block_release(_onActionSheetCancel);
        _onActionSheetCancel = nil;
    }
    _onActionSheetCancel = Block_copy(onActionSheetCancel);
}

@end

